import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';
import bcrypt from 'bcryptjs';

@Entity()
export class SharepointConnection {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ nullable: false, unique: true, length: 20 })
    tenantId!: string;

    @Column({ nullable: false, unique: true, length: 255 })
    clientId!: string;

    @Column({ nullable: false })
    hashSecret!: string;

    @Column({ nullable: false })
    salt!: string;

    setPassword(password: string) {
        this.salt = bcrypt.genSaltSync(12);
        this.hashSecret = bcrypt.hashSync(password, this.salt);
    }

    verifyPassword(password: string) {
        const hash = bcrypt.hashSync(password, this.salt);
        return hash === this.hashSecret;
    }
}