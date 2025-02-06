import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { EventsModule } from '../events/events.module'; // 🔹 Importando EventsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([]), // Se houver entidades específicas para Insights, adicione aqui
    EventsModule, // 🔹 Importando EventsModule para acessar EventsGateway
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}
