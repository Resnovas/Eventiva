import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomCreateManyAddressInput } from "../inputs/RoomCreateManyAddressInput";

@TypeGraphQL.InputType("RoomCreateManyAddressInputEnvelope", {
  isAbstract: true
})
export class RoomCreateManyAddressInputEnvelope {
  @TypeGraphQL.Field(_type => [RoomCreateManyAddressInput], {
    nullable: false
  })
  data!: RoomCreateManyAddressInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
