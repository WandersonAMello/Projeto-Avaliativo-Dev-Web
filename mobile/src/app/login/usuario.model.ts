export class Usuario {
    public id?: number;
    public username: string;
    public email?: string;
    public token?: string;

    constructor() {
        this.username = '';
        this.email = '';
        this.token = '';
    }
}