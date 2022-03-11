import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomCreateManyRoomInput } from "../inputs/ArrangementOfRoomCreateManyRoomInput";

@TypeGraphQL.InputType("ArrangementOfRoomCreateManyRoomInputEnvelope", {
  isAbstract: true
})
export class ArrangementOfRoomCreateManyRoomInputEnvelope {
  @TypeGraphQL.Field(_type => [ArrangementOfRoomCreateManyRoomInput], {
    nullable: false
  })
  data!: ArrangementOfRoomCreateManyRoomInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
