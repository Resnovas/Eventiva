import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ArrangementOfRoomUpdateManyMutationInput } from "../../../inputs/ArrangementOfRoomUpdateManyMutationInput";
import { ArrangementOfRoomWhereInput } from "../../../inputs/ArrangementOfRoomWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyArrangementOfRoomArgs {
  @TypeGraphQL.Field(_type => ArrangementOfRoomUpdateManyMutationInput, {
    nullable: false
  })
  data!: ArrangementOfRoomUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereInput, {
    nullable: true
  })
  where?: ArrangementOfRoomWhereInput | undefined;
}
