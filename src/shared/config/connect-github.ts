import { graphql } from "@octokit/graphql";
import { Injectable } from "@nestjs/common";
@Injectable()
export class ConnectGitHub {
      private client: typeof graphql;
      private githubToken = process.env.GITHUB_PAT_TOKEN;
      constructor() {
            if (!this.githubToken) {
                  throw new Error("GITHUB_PAT_TOKEN is not defined in environment variables.");
            }
            this.client = graphql.defaults({
                  headers: {
                        authorization: `token ${this.githubToken}`,
                  },
            });
      }

      getClient() {
            return this.client;
      }
}

