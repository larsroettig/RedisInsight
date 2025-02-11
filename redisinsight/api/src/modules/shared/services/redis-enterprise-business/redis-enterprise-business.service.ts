import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  IRedisEnterpriseDatabase,
  IRedisEnterpriseEndpoint,
  IRedisEnterpriseModule,
  IRedisEnterpriseReplicaSource,
  RedisEnterpriseDatabaseAofPolicy,
  RedisEnterpriseDatabasePersistence,
} from 'src/modules/redis-enterprise/models/redis-enterprise-database';
import { RedisPersistencePolicy } from 'src/modules/redis-enterprise/models/redis-cloud-database';
import {
  ClusterConnectionDetailsDto,
  RedisEnterpriseDatabase,
} from 'src/modules/redis-enterprise/dto/cluster.dto';
import { convertREClusterModuleName } from 'src/modules/redis-enterprise/utils/redis-enterprise-converter';
import { AutodiscoveryAnalyticsService } from '../autodiscovery-analytics.service/autodiscovery-analytics.service';

@Injectable()
export class RedisEnterpriseBusinessService {
  private logger = new Logger('RedisEnterpriseBusinessService');

  constructor(private autodiscoveryAnalyticsService: AutodiscoveryAnalyticsService) {}

  private api = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  async getDatabases(
    dto: ClusterConnectionDetailsDto,
  ): Promise<RedisEnterpriseDatabase[]> {
    this.logger.log('Getting RE cluster databases.');
    const {
      host, port, username, password,
    } = dto;
    const auth = { username, password };
    try {
      const { data } = await this.api.get(`https://${host}:${port}/v1/bdbs`, {
        auth,
      });
      this.logger.log('Succeed to get RE cluster databases.');
      const result = this.parseClusterDbsResponse(data);
      this.autodiscoveryAnalyticsService.sendGetREClusterDbsSucceedEvent(result);
      return result;
    } catch (error) {
      const { response } = error;
      let exception;
      this.logger.error(`Failed to get RE cluster databases. ${error.message}`);
      if (response?.status === 401 || response?.status === 403) {
        exception = new ForbiddenException(
          ERROR_MESSAGES.INCORRECT_CREDENTIALS(`${host}:${port}`),
        );
      } else {
        exception = new BadRequestException(
          ERROR_MESSAGES.INCORRECT_DATABASE_URL(`${host}:${port}`),
        );
      }
      this.autodiscoveryAnalyticsService.sendGetREClusterDbsFailedEvent(exception);
      throw exception;
    }
  }

  private parseClusterDbsResponse(
    databases: IRedisEnterpriseDatabase[],
  ): RedisEnterpriseDatabase[] {
    const result: RedisEnterpriseDatabase[] = [];
    databases.forEach((database) => {
      const {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        uid, name, crdt, tls_mode, crdt_replica_id,
      } = database;
      // Get all external endpoint, ignore others
      const externalEndpoint = this.getDatabaseExternalEndpoint(database);
      // Skip this database is there are no external endpoints
      if (!externalEndpoint) {
        return;
      }
      // For Active-Active (CRDT) databases, append the replica ID to the name
      // so the name doesn't clash when the other replicas are added.
      const dbName = crdt ? `${name}-${crdt_replica_id}` : name;
      const dnsName = externalEndpoint.dns_name;
      const address = externalEndpoint.addr[0];
      result.push(
        new RedisEnterpriseDatabase({
          uid,
          name: dbName,
          dnsName,
          address,
          port: externalEndpoint.port,
          password: database.authentication_redis_pass,
          status: database.status,
          tls: tls_mode === 'enabled',
          modules: database.module_list.map(
            (module: IRedisEnterpriseModule) => convertREClusterModuleName(module.module_name),
          ),
          options: {
            enabledDataPersistence:
              database.data_persistence
              !== RedisEnterpriseDatabasePersistence.Disabled,
            persistencePolicy: this.getDatabasePersistencePolicy(database),
            enabledRedisFlash: database.bigstore,
            enabledReplication: database.replication,
            enabledBackup: database.backup,
            enabledActiveActive: database.crdt,
            enabledClustering: database.shards_count > 1,
            isReplicaDestination: !!database?.replica_sources?.length,
            isReplicaSource: !!this.findReplicasForDatabase(databases, database)
              .length,
          },
        }),
      );
    });
    return result;
  }

  public getDatabaseExternalEndpoint(
    database: IRedisEnterpriseDatabase,
  ): IRedisEnterpriseEndpoint {
    return database.endpoints.filter((endpoint: { addr_type: string }) => endpoint.addr_type === 'external')[0];
  }

  private getDatabasePersistencePolicy(
    database: IRedisEnterpriseDatabase,
  ): RedisPersistencePolicy {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { data_persistence, aof_policy, snapshot_policy } = database;
    if (data_persistence === RedisEnterpriseDatabasePersistence.Aof) {
      return aof_policy === RedisEnterpriseDatabaseAofPolicy.AofEveryOneSecond
        ? RedisPersistencePolicy.AofEveryOneSecond
        : RedisPersistencePolicy.AofEveryWrite;
    }
    if (data_persistence === RedisEnterpriseDatabasePersistence.Snapshot) {
      const { secs } = snapshot_policy.pop();
      if (secs === 3600) {
        return RedisPersistencePolicy.SnapshotEveryOneHour;
      }
      if (secs === 21600) {
        return RedisPersistencePolicy.SnapshotEverySixHours;
      }
      if (secs === 43200) {
        return RedisPersistencePolicy.SnapshotEveryTwelveHours;
      }
    }
    return RedisPersistencePolicy.None;
  }

  private findReplicasForDatabase(
    databases: IRedisEnterpriseDatabase[],
    sourceDatabase: IRedisEnterpriseDatabase,
  ): IRedisEnterpriseDatabase[] {
    const sourceEndpoint = this.getDatabaseExternalEndpoint(sourceDatabase);
    if (!sourceEndpoint) {
      return [];
    }
    return databases.filter((replica: IRedisEnterpriseDatabase): boolean => {
      const replicaSources = replica.replica_sources;
      if (replica.uid === sourceDatabase.uid || !replicaSources?.length) {
        return false;
      }
      return replicaSources.some(
        (source: IRedisEnterpriseReplicaSource): boolean => source.uri.includes(
          `${sourceEndpoint.dns_name}:${sourceEndpoint.port}`,
        ),
      );
    });
  }
}
