import {
    Column,
    Entity, OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import bcrypt from 'bcryptjs';

import { LegitoConnection } from './legitoConnection';

@Entity()
export class SharepointConnection {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ nullable: false, unique: true, length: 255 })
    tenantId!: string;

    @Column({ nullable: false, unique: true, length: 255 })
    clientId!: string;

    @Column({ nullable: false })
    hashSecret!: string;

    @OneToOne(() => LegitoConnection, { nullable: true, cascade: true })
    legitoConnection!: LegitoConnection;

    setPassword(password: string) {
        this.hashSecret = bcrypt.hashSync(password, 12); // Correct way to hash a password
    }

    verifyPassword(password: string) {
        return bcrypt.compareSync(password, this.hashSecret); // Correct way to verify a password
    }
}