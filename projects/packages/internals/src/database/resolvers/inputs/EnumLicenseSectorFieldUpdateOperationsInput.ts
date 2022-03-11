import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { LicenseSector } from "../../enums/LicenseSector";

@TypeGraphQL.InputType("EnumLicenseSectorFieldUpdateOperationsInput", {
  isAbstract: true
})
export class EnumLicenseSectorFieldUpdateOperationsInput {
  @TypeGraphQL.Field(_type => LicenseSector, {
    nullable: true
  })
  set?: "CVIT" | "CP" | "DS" | "CCTV" | "SG" | "VI" | "KH" | "UNKNOWN" | undefined;
}
