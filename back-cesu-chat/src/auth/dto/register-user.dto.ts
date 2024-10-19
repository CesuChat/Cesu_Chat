import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3) 
  @MaxLength(20) 
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6) 
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty() //PRÉ DEFINIÇÃO DE CURSOS PARA NÃO HAVER DIFERENÇA
  curse: string 

}
