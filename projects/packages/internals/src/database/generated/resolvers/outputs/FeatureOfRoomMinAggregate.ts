import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.ObjectType("FeatureOfRoomMinAggregate", {
  isAbstract: true
})
export class FeatureOfRoomMinAggregate {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  roomId!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  featureId!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate!: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted!: boolean | null;
}
