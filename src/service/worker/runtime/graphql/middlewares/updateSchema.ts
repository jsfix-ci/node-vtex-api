import { ExecutableSchema } from '../typings'
import { makeSchema } from '../schema/index'
import { GraphQLServiceContext } from '../typings'
import { GraphQLOptions, ParamsContext, RecorderState } from '../../typings'
import { IOClients } from '../../../../../clients'
import { PROVIDER_HEADER } from '../../../../../constants'

export const updateSchema = <T extends IOClients, U extends RecorderState, V extends ParamsContext>(
  graphql: GraphQLOptions<T, U, V>,
  executableSchema: ExecutableSchema
) =>
  async function updateRunnableSchema(ctx: GraphQLServiceContext, next: () => Promise<void>) {
    const {
      clients: { apps },
      vtex: { logger },
      app,
    } = ctx
    // updates the provider app, fetches the new schema and generate a new runnable schema
    if (
      executableSchema.hasProvider &&
      (!executableSchema.provider || executableSchema.provider !== ctx.headers[PROVIDER_HEADER])
    ) {
      executableSchema.provider = ctx.headers[PROVIDER_HEADER]

      try {
        const newSchema = (await apps.getAppFile(ctx.headers[PROVIDER_HEADER], 'public/schema.graphql')).data.toString(
          'utf-8'
        )
        graphql.schema = newSchema
        const newRunnableSchema = makeSchema(graphql)
        executableSchema.schema = newRunnableSchema.schema
      } catch (error) {
        logger.error({ error, message: 'Update schema failed', app })
      }
    }
    await next()
  }
