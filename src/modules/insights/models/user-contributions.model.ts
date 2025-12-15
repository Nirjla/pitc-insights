import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType({ description: "Get list of users of an organization with their contributions" })
export class UserContributions {
      @Field(() => String, { description: "User name" })
      userName: string;

      @Field(() => Int, { description: "Number of contributions" })
      contributions: number;
}