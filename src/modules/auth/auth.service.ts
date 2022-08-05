import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';

import { Message } from '../user/constants/message.constants';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto';
import { SignupDto } from './dto/signup.dto';
import { TokenPair } from './interfaces/token-pair.interface';
import { TokenRepository } from './repositories/token.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly tokenRepository: TokenRepository,
    private readonly userService: UserService,
  ) {}

  async signup(signupDto: SignupDto): Promise<UserEntity> {
    const user = await this.userService.create(signupDto);
    return user;
  }

  async login(loginDto: LoginDto): Promise<TokenPair> {
    const user = await this.userService.findByLogin(loginDto.login);

    const passwordMatches = await compare(loginDto.password, user.password);
    if (!passwordMatches) throw new ForbiddenException(Message.FORBIDDEN);

    const tokenPair = await this.issueTokenPair(user.id, user.login);
    return tokenPair;
  }

  private async issueTokenPair(
    userId: string,
    login: string,
  ): Promise<TokenPair> {
    const payload = {
      id: userId,
      login,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: this.config.get('TOKEN_EXPIRE_TIME'),
        secret: this.config.get('JWT_SECRET_KEY'),
      }),
      this.jwt.signAsync(payload, {
        expiresIn: this.config.get('TOKEN_REFRESH_EXPIRE_TIME'),
        secret: this.config.get('JWT_SECRET_REFRESH_KEY'),
      }),
    ]);

    const hashedRefreshToken = await hash(refreshToken, 10);
    await this.tokenRepository.save(userId, hashedRefreshToken);

    return { accessToken, refreshToken };
  }
}