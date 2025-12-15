import { InsightsService } from "./insights.service";
import { Field, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { Insights } from "./models/insights.model";
import { UserContributions } from "./models/user-contributions.model";
import { OrgCommits } from "./models/org-commits.model";

// Note: Resolver provide the instruction to GraphQL on how to fetch the data for a query or mutation

@Resolver(() => Insights)
export class InsightsResolver {
      constructor(
            private readonly insightsService: InsightsService
      ) { }

      @Query(() => Insights, { description: "Get insights for the organization" })
      async getInsights() {
            return {
                  organizationName: this.insightsService.organizationName,
            };
      }

      @ResolveField(() => [OrgCommits], { description: "Organization Name" })
      orgCommits(@Parent() insights: Insights) {
            return this.insightsService.getOrgTotalCommits();
      }

      @ResolveField(() => [UserContributions], { description: "User Contributions" })
      userContributions(@Parent() insights: Insights) {
            return this.insightsService.getOrgUserContributions();
      }
}