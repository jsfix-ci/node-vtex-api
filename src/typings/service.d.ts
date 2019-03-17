import { DataSource } from 'apollo-datasource'
import { Context } from 'koa'
import { MetricsLogger } from '../metrics/logger'
import { IOClients } from '../clients/IOClients'

export interface ServiceContext<T extends IOClients = IOClients> extends Context {
  clients: T
  vtex: IOContext
  dataSources?: DataSources
  metricsLogger?: MetricsLogger
}

export interface DataSources {
  [name: string]: DataSource<ServiceContext>,
}

export interface IOContext {
  account: string,
  authToken: string,
  production: boolean,
  recorder?: Recorder,
  region: string,
  route: {
    declarer?: string
    id: string
    params: ParsedUrlQuery,
  }
  userAgent: string,
  workspace: string,
  segmentToken?: string
  sessionToken?: string
}
