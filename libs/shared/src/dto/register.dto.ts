import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator'

export class RegisterDto {
    @IsEmail()
    email!: string

    @IsString()
    @MinLength(8)
    password!: string

    @IsString()
    @MinLength(8)
    @MaxLength(15)
    @IsOptional()
    phone?: string
}
