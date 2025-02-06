// src/search/search.module.ts
import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module'; // Importar EventsModule

@Module({
  imports: [
    UsersModule,
    EventsModule, // Adicione o EventsModule aqui
  ],
  controllers: [SearchController],
  providers: [],
})
export class SearchModule {}
