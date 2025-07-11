import { Injectable } from '@nestjs/common';
import { GenerateIdDto, IdStrategy } from '../dto/invoiceId.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CommonService {
  private counters = new Map<string, number>();

  /**
   * Generate invoice ID
   */
  generateId(dto: GenerateIdDto): string {
    const { strategy, prefix = 'INV', startCounter = 1 } = dto;

    switch (strategy) {
      case IdStrategy.SEQUENTIAL:
        return this.generateSequential(prefix, startCounter);

      case IdStrategy.UUID:
        return this.generateUuid(prefix);

      case IdStrategy.TIMESTAMP:
        return this.generateTimestamp(prefix);

      default:
        throw new Error('Invalid strategy');
    }
  }

  /**
   * Validate invoice ID format
   */
  validate(invoiceId: string): boolean {
    if (!invoiceId || invoiceId.length < 3 || invoiceId.length > 50) {
      return false;
    }
    return /^[A-Za-z0-9\-_]+$/.test(invoiceId);
  }

  /**
   * Generate sequential ID: INV-001, INV-002
   */
  private generateSequential(prefix: string, startCounter: number): string {
    const counter = this.counters.get(prefix) || startCounter;
    this.counters.set(prefix, counter + 1);
    return `${prefix}-${counter.toString().padStart(3, '0')}`;
  }

  /**
   * Generate UUID-based ID: INV-A1B2C3D4
   */
  private generateUuid(prefix: string): string {
    const uuid = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
    return `${prefix}-${uuid}`;
  }

  /**
   * Generate timestamp ID: INV-1642784523
   */
  private generateTimestamp(prefix: string): string {
    const timestamp = Date.now().toString().slice(-8);
    return `${prefix}-${timestamp}`;
  }

  /**
   * Reset counter for prefix
   */
  resetCounter(prefix: string, value: number = 1): void {
    this.counters.set(prefix, value);
  }

  /**
   * Get current counter
   */
  getCounter(prefix: string): number {
    return this.counters.get(prefix) || 1;
  }
}
