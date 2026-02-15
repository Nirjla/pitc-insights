import { Injectable } from "@nestjs/common";
import { InsightsService } from "../insights.service";
import { ConnectRedis } from "../../../shared/config/connect-redis";

@Injectable()
export class CronService {
      constructor(
            private readonly insightsService: InsightsService,
            private readonly connectRedis: ConnectRedis
      ) { }
      async runApi() {
            console.log("Cron job started");
            await this.connectRedis.ping();
            await this.insightsService.getOrgTotalCommits();
            await this.insightsService.getOrgUserContributions();
            await this.insightsService.getOrgUserWeeklyContributions();
      }
}