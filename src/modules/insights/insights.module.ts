import { Module } from "@nestjs/common";
import { InsightsService } from "./insights.service.ts";
import { InsightsResolver } from "./insights.resolver.ts";
import { ConnectGitHub } from "../../shared/config/connect-github.ts";
import { ConnectRedis } from "../../shared/config/connect-redis.ts";

@Module({
      // NOTE: providers such as services, resolvers and  other injectable classes are registered here 
      providers: [InsightsService, InsightsResolver, ConnectGitHub, ConnectRedis],
      //  Note : if you want to use this service in other modules, you need to export it
      exports: [InsightsService],
})
export class InsightsModule { }
