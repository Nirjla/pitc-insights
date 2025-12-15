import { Field, ObjectType } from "@nestjs/graphql";
import { OrgCommits } from "./org-commits.model";
import { UserContributions } from "./user-contributions.model";

@ObjectType({ description: "Get Insights of an organization" })

export class Insights {
      @Field(() => String, { description: "Organization name" })
      organizationName: string;

      @Field(type => [OrgCommits], { description: "List of repositories with their total commits" })
      orgCommits: OrgCommits[];

      @Field(type => [UserContributions], { description: "List of users with their contributions" })
      userContributions: UserContributions[];
}