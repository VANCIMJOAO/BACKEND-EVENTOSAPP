import { ApiProperty } from '@nestjs/swagger';

export class EventDto {
  @ApiProperty({
    description: 'ID do evento',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Título do evento',
    example: 'Concerto de Rock',
  })
  title: string;

  // Adicione outras propriedades relevantes, se necessário.
}
