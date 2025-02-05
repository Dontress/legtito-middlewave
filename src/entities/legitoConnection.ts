import {
    Column,
    Entity, JoinColumn, OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import bcrypt from 'bcryptjs';

import { SharepointConnection } from './sharepointConnection';

@Entity()
export class LegitoConnection {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ nullable: false, unique: false, length: 255 })
    apiKey!: string;

    @Column({ nullable: false, unique: false, length: 255 })
    domain!: string;

    @Column({ nullable: false })
    hashSecret!: string;

    @OneToOne(() => SharepointConnection, sharepointConnection => sharepointConnection.legitoConnection, {
        cascade: true,
        onDelete: "CASCADE",
        nullable: true
    })
    @JoinColumn()
    sharepointConnection!: SharepointConnection;

    setSecret(password: string) {
        this.hashSecret = bcrypt.hashSync(password, 12);
    }

    verifySecret(password: string) {
        return bcrypt.compareSync(password, this.hashSecret);
    }
}