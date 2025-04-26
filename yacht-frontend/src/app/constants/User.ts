import {Role} from './Role.enum';

export class User {
  id?: number ;
  name: string = '';
  email: string = '';
  password: string = '';
  role: Role = Role.CLIENT;
  image: any = null;
  isValidedByAdmin?: boolean = false;

}
