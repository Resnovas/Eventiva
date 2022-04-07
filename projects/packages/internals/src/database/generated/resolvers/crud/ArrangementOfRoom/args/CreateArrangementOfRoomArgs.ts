import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ArrangementOfRoomCreateInput } from "../../../inputs/ArrangementOfRoomCreateInput";

@TypeGraphQL.ArgsType()
export class CreateArrangementOfRoomArgs {
  @TypeGraphQL.Field(_type => ArrangementOfRoomCreateInput, {
    nullable: false
  })
  data!: ArrangementOfRoomCreateInput;
}
