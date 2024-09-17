import { IsNotEmpty } from 'class-validator';
export class UpdateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;
}
