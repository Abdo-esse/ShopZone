import { Controller } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { RegisterDto } from '../../../libs/shared/src/dto/register.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) { }

  @MessagePattern('user.registered')
  async register(@Payload() dto: RegisterDto) {
    console.log('User registered   :', dto);
    return this.authServiceService.register(dto);
  }

  @MessagePattern('user.login')
  async login(@Payload() dto: any) {
    console.log('User login attempt :', dto.email);
    return this.authServiceService.login(dto);
  }

  @MessagePattern('user.refresh')
  async refresh(@Payload() data: { refreshToken: string }) {
    console.log('Token refresh attempt');
    return this.authServiceService.refresh(data.refreshToken);
  }

  @MessagePattern('user.logout')
  async logout(@Payload() data: { userId: string; refreshToken: string }) {
    console.log('Logout attempt for user:', data.userId);
    return this.authServiceService.logout(data.userId, data.refreshToken);
  }
}
