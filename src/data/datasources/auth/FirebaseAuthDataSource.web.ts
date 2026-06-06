import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../../config/firebase';
import { User as DomainUser } from '../../../domain/entities/User';;
import { FirebaseAuthDataSourceBase } from './FirebaseAuthDataSourceBase';


export class FirebaseAuthDataSource extends FirebaseAuthDataSourceBase {
  async loginWithGoogle(): Promise<DomainUser> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return this.mapFirebaseUserToDomain(result.user);
  }

  async loginWithGitHub(): Promise<DomainUser> {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return this.mapFirebaseUserToDomain(result.user);
  }
}