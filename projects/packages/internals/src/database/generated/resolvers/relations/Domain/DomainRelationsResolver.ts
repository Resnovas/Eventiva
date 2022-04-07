import * as TypeGraphQL from "type-graphql";
import { Domain } from "../../../models/Domain";
import { Email } from "../../../models/Email";
import { DomainLinkedEmailsArgs } from "./args/DomainLinkedEmailsArgs";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Domain)
export class DomainRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => [Email], {
    nullable: false
  })
  async linkedEmails(@TypeGraphQL.Root() domain: Domain, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: DomainLinkedEmailsArgs): Promise<Email[]> {
    return getPrismaFromContext(ctx).domain.findUnique({
      where: {
        id: domain.id,
      },
    }).linkedEmails(args);
  }
}
