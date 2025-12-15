import { ConnectGitHub } from "src/shared/config/connect-github";
import { Injectable } from "@nestjs/common";
import { ConnectRedis } from "src/shared/config/connect-redis";

// Note: Its better use a graphql variable when wrtiting queries to avoid injection attacks
//  Note: You can make 5000 requests per hour with authentication, unauthenticated requests get 60 requests per hour

interface RepoCommitsResponse {
      repository: {
            ref: {
                  target: {
                        history: {
                              totalCount: number;
                        };
                  };
            } | null;
      };
}

@Injectable()
export class InsightsService {
      organizationName: string = process.env.GITHUB_ORG_NAME || "";
      private repoNumber: number = process.env.GITHUB_REPO_NUMBER
            ? parseInt(process.env.GITHUB_REPO_NUMBER)
            : 100;
      private userNumber: number = process.env.GITHUB_USER_NUMBER
            ? parseInt(process.env.GITHUB_USER_NUMBER)
            : 100;
      private ORG_COMMITS_PREFIX = 'orgTotalCommits_';
      private ORG_USER_CONTRIBUTIONS_PREFIX = 'orgUserContributions_';
      private SESSION_TTL_SECONDS = 3600; // 1 hour
      constructor(private readonly connectGitHub: ConnectGitHub, private readonly connectRedis: ConnectRedis) { }



      async getOrgTotalCommits(): Promise<{ repoName: string; commits: number }[]> {
            try {
                  const cachedData = await this.connectRedis.get<{ repoName: string; commits: number }[]>(this.ORG_COMMITS_PREFIX + this.organizationName);
                  if (cachedData) {
                        console.log("Returning cached organization total commits");
                        return cachedData;
                  }
                  const repos = await this.connectGitHub.getClient()<{
                        organization: {
                              repositories: {
                                    pageInfo: { hasNextPage: boolean; endCursor: string };
                                    nodes: { name: string; defaultBranchRef: { target: { history: { totalCount: number } } } | null }[];
                              };
                        };
                  }>(
                        `query GetOrgReposWithCommits($organizationName: String!, $num: Int!, $cursor: String) {
                        organization(login: $organizationName) {
                              repositories(first: $num, after: $cursor) {
                                    pageInfo {
                                          hasNextPage
                                          endCursor
                                    }
                                    nodes {
                                          name
                                          defaultBranchRef {
                                                target {
                                                      ... on Commit {
                                                            history {
                                                                  totalCount
                                                            }
                                                      }
                                                }
                                          }
                                    }
                              }
                        }
                  }`,
                        {
                              organizationName: this.organizationName,
                              cursor: null,
                              num: this.repoNumber,
                        },
                  );
                  console.log("Fetched repositories:", repos.organization.repositories.nodes.length);
                  const orgCommits = repos.organization.repositories.nodes.map((repo) => ({
                        repoName: repo.name,
                        commits: repo?.defaultBranchRef?.target.history.totalCount ?? 0,
                  }));
                  await this.connectRedis.set(this.ORG_COMMITS_PREFIX + this.organizationName, orgCommits, this.SESSION_TTL_SECONDS);
                  return orgCommits;
            }
            catch (error) {
                  console.error("Error fetching organization total commits:", error);
                  throw new Error("Failed to fetch organization total commits.");
            }
      }

      async getOrgUserContributions(): Promise<{ userName: string; contributions: number }[]> {
            try {
                  const cachedData = await this.connectRedis.get<{ userName: string; contributions: number }[]>(this.ORG_USER_CONTRIBUTIONS_PREFIX + this.organizationName);
                  if (cachedData) {
                        console.log("Returning cached organization user contributions");
                        return cachedData;
                  }
                  const result = await this.connectGitHub.getClient()<{
                        organization: {
                              membersWithRole: {
                                    nodes: {
                                          login: string;
                                          contributionsCollection: {
                                                totalCommitContributions: number;
                                          };
                                    }[];
                              };
                        };
                  }>(
                        `query GetOrgMembers($organizationName: String!, $num: Int!) {
                        organization(login: $organizationName) {
                              membersWithRole(first: $num) {
                                    nodes {
                                          login
                                          contributionsCollection {
                                                totalCommitContributions
                                          }
                                    }
                              }
                        }
                  }`,
                        {
                              organizationName: this.organizationName,
                              num: this.userNumber,
                        },
                  );
                  console.log("Fetched organization members:", result.organization.membersWithRole.nodes.length);
                  const userContributions = result.organization.membersWithRole.nodes.map((node) => ({
                        userName: node.login,
                        contributions: node.contributionsCollection.totalCommitContributions,
                  }));
                  await this.connectRedis.set(this.ORG_USER_CONTRIBUTIONS_PREFIX + this.organizationName, userContributions, this.SESSION_TTL_SECONDS);
                  return userContributions;
            }
            catch (error) {
                  console.error("Error fetching organization user contributions:", error);
                  throw new Error("Failed to fetch organization user contributions.");
            }
      }

      async getInsights() {
            // const [orgCommits, userContributions] = await Promise.all([
            //       this.getOrgTotalCommits(),
            //       this.getOrgUserContributions(),
            // ]);

            return {
                  organizationName: this.organizationName,
                  // orgCommits,
                  // userContributions,
            };
      }
}