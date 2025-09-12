import { Controller, Post, Body, Headers } from '@nestjs/common'
import { FieldCreate, FieldValueUpsert } from './dto'
@Controller('custom-fields')
export class CustomFieldsController {
  @Post() create(@Body() b:any){ const input = FieldCreate.parse(b); return { ok:true, input } }
  @Post('values') upsert(@Body() b:any){ const input = FieldValueUpsert.parse(b); return { ok:true, input } }
}