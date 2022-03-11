import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ArrangementOfRoomWhereInput } from "../../../inputs/ArrangementOfRoomWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyArrangementOfRoomArgs {
  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereInput, {
    nullable: true
  })
  where?: ArrangementOfRoomWhereInput | undefined;
}
