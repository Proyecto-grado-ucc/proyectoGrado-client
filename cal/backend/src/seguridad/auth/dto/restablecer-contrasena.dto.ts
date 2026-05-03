import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RestablecerContrasenaDto {
  @ApiProperty({ description: 'Token recibido por correo' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Nueva contrasena (minimo 8 caracteres)', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  nuevaContrasena: string;
}
