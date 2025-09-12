import { LibraryRepository, MockLibraryRepository } from './library.repository';

/**
 * Repository Factory
 * Creates appropriate repository instances based on environment configuration
 */
export class RepositoryFactory {
  private static useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  /**
   * Create Library Repository
   */
  static createLibraryRepository(): LibraryRepository | MockLibraryRepository {
    if (this.useMockData) {
      return new MockLibraryRepository();
    }
    return new LibraryRepository();
  }

  /**
   * Check if we're in mock mode
   */
  static isMockMode(): boolean {
    return this.useMockData;
  }

  /**
   * Force mock mode for testing
   */
  static setMockMode(enabled: boolean): void {
    this.useMockData = enabled;
  }
}

// Export singleton instances
export const libraryRepository = RepositoryFactory.createLibraryRepository();