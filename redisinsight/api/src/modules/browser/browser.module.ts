import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { SharedModule } from 'src/modules/shared/shared.module';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { HashController } from './controllers/hash/hash.controller';
import { KeysController } from './controllers/keys/keys.controller';
import { KeysBusinessService } from './services/keys-business/keys-business.service';
import { StringController } from './controllers/string/string.controller';
import { ListController } from './controllers/list/list.controller';
import { SetController } from './controllers/set/set.controller';
import { ZSetController } from './controllers/z-set/z-set.controller';
import { RejsonRlController } from './controllers/rejson-rl/rejson-rl.controller';
import { HashBusinessService } from './services/hash-business/hash-business.service';
import { SetBusinessService } from './services/set-business/set-business.service';
import { StringBusinessService } from './services/string-business/string-business.service';
import { ListBusinessService } from './services/list-business/list-business.service';
import { ZSetBusinessService } from './services/z-set-business/z-set-business.service';
import { RejsonRlBusinessService } from './services/rejson-rl-business/rejson-rl-business.service';
import { BrowserToolService } from './services/browser-tool/browser-tool.service';
import { BrowserToolClusterService } from './services/browser-tool-cluster/browser-tool-cluster.service';
import { BrowserAnalyticsService } from './services/browser-analytics/browser-analytics.service';

@Module({
  imports: [SharedModule],
  controllers: [
    KeysController,
    StringController,
    ListController,
    SetController,
    ZSetController,
    RejsonRlController,
    HashController,
  ],
  providers: [
    KeysBusinessService,
    StringBusinessService,
    ListBusinessService,
    SetBusinessService,
    ZSetBusinessService,
    RejsonRlBusinessService,
    HashBusinessService,
    BrowserToolService,
    BrowserToolClusterService,
    BrowserAnalyticsService,
  ],
})
export class BrowserModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(
        RouterModule.resolvePath(KeysController),
        RouterModule.resolvePath(StringController),
        RouterModule.resolvePath(HashController),
        RouterModule.resolvePath(ListController),
        RouterModule.resolvePath(SetController),
        RouterModule.resolvePath(ZSetController),
        RouterModule.resolvePath(RejsonRlController),
      );
  }
}
