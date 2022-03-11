import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SIACheckUpdateManyMutationInput } from "../../../inputs/SIACheckUpdateManyMutationInput";
import { SIACheckWhereInput } from "../../../inputs/SIACheckWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManySIACheckArgs {
  @TypeGraphQL.Field(_type => SIACheckUpdateManyMutationInput, {
    nullable: false
  })
  data!: SIACheckUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => SIACheckWhereInput, {
    nullable: true
  })
  where?: SIACheckWhereInput | undefined;
}
