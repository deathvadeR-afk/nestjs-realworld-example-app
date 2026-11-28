import { ArticleService, cleanTagList } from '../article.service';
import { Article } from '../article.entity';
import { User } from '../../user/user.entity';

describe('cleanTagList', () => {
  it("[QP-SMNEST-6-1] Returns the cleaned list for the request's example", () => {
    expect(cleanTagList(['  NestJS', 'nestjs', '', 'Testing ', 'testing', 'API'])).toEqual([
      'nestjs',
      'testing',
      'api',
    ]);
  });

  it('[QP-SMNEST-6-2] Trims whitespace and lower-cases each tag', () => {
    expect(cleanTagList(['  NestJS', 'Testing '])).toEqual(['nestjs', 'testing']);
  });

  it('[QP-SMNEST-6-3] Drops entries that are empty once trimmed', () => {
    expect(cleanTagList(['', '   ', 'API'])).toEqual(['api']);
  });

  it('[QP-SMNEST-6-4] Keeps the first occurrence order when removing duplicates', () => {
    expect(cleanTagList(['testing', 'nestjs', 'testing', 'api', 'nestjs'])).toEqual(['testing', 'nestjs', 'api']);
  });

  it('[QP-SMNEST-6-5] Returns an empty list when given an empty list', () => {
    expect(cleanTagList([])).toEqual([]);
  });
});

describe('ArticleService.create', () => {
  it('[QP-SMNEST-6-6] Saves the cleaned tags when an article is created', async () => {
    const author = new User('author', 'author@example.com', 'secret');
    const add = vi.fn();
    (author as any).articles = { add };
    const em = {
      populate: vi.fn(async (entity: unknown) => (entity === author ? author : { toJSON: () => ({}) })),
      flush: vi.fn(async () => undefined),
    };
    const service = new ArticleService(em as any, {} as any, {} as any, {} as any);

    await service.create(author as any, {
      title: 'NestJS testing',
      description: 'desc',
      body: 'body',
      tagList: ['  NestJS', 'nestjs', '', 'Testing ', 'testing', 'API'],
    });

    const saved = add.mock.calls[0][0] as Article;
    expect(saved.tagList).toEqual(['nestjs', 'testing', 'api']);
  });
});
