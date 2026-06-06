import { FirebaseAuthDataSourceBase } from './FirebaseAuthDataSourceBase';
import { User as DomainUser } from '../../../domain/entities/User';

export class FirebaseAuthDataSource extends FirebaseAuthDataSourceBase {
  async loginWithGoogle(): Promise<DomainUser> {
    throw new Error('Google Sign-In no disponible en esta version nativa');
  }

  async loginWithGitHub(): Promise<DomainUser> {
    throw new Error('GitHub Sign-In no disponible en esta version nativa');
  }
}