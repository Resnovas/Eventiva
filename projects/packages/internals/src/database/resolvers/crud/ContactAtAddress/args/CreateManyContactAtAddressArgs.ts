import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ContactAtAddressCreateManyInput } from "../../../inputs/ContactAtAddressCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyContactAtAddressArgs {
  @TypeGraphQL.Field(_type => [ContactAtAddressCreateManyInput], {
    nullable: false
  })
  data!: ContactAtAddressCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
