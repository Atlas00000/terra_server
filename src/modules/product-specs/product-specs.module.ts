import { Module } from '@nestjs/common';
import { ProductSpecsController } from './product-specs.controller';
import { ProductSpecsService } from './product-specs.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductSpecsController],
  providers: [ProductSpecsService],
  exports: [ProductSpecsService],
})
export class ProductSpecsModule {}

