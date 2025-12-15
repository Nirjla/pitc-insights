import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType({ description: "Get organization total commits" })
export class OrgCommits {
      @Field(() => String, { description: "Repository name" })
      repoName: string;

      @Field(() => Int, { description: "Total commits" })
      commits: number;
}