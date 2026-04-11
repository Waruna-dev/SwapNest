import { describe, it, expect } from 'vitest';
import { formatPrice, formatRelativeDate, getPrimaryImage } from './itemGalleryUtils.js';

describe('itemGalleryUtils', () => {
  describe('formatPrice', () => {
    it('should format price with Rs prefix', () => {
      expect(formatPrice(1000)).toBe('Rs 1,000');
      expect(formatPrice(50000)).toBe('Rs 50,000');
    });

    it('should handle missing price', () => {
      expect(formatPrice(null)).toBe('Rs 0');
      expect(formatPrice(undefined)).toBe('Rs 0');
    });
  });

  describe('formatRelativeDate', () => {
    it('should return "Listed today" for current date', () => {
      const today = new Date().toISOString();
      expect(formatRelativeDate(today)).toBe('Listed today');
    });

    it('should return "Listed yesterday" for one day ago', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatRelativeDate(yesterday.toISOString())).toBe('Listed yesterday');
    });

    it('should return "Recently listed" for null date', () => {
      expect(formatRelativeDate(null)).toBe('Recently listed');
    });
  });

  describe('getPrimaryImage', () => {
    it('should return coverImage url if available', () => {
      const item = { coverImage: { url: 'cover.jpg' } };
      expect(getPrimaryImage(item)).toBe('cover.jpg');
    });

    it('should return first image url if coverImage is not available', () => {
      const item = { images: [{ url: 'image1.jpg' }, { url: 'image2.jpg' }] };
      expect(getPrimaryImage(item)).toBe('image1.jpg');
    });

    it('should return default unsplash image if no images available', () => {
      const item = {};
      expect(getPrimaryImage(item)).toContain('unsplash.com');
    });
  });
});
