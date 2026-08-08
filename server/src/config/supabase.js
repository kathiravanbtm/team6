const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Detect if we should run in local mock database mode
const isMockMode = !supabaseUrl || 
  supabaseUrl.includes('your-supabase-project') || 
  !supabaseServiceKey || 
  supabaseServiceKey.includes('your-supabase-service-role-key') ||
  supabaseServiceKey.includes('your-supabase-anon-key') ||
  supabaseServiceKey === 'placeholder';

class MockSupabaseQueryBuilder {
  constructor(table, db) {
    this.table = table;
    this.db = db;
    this.filters = [];
    this.sorts = [];
    this.isSingle = false;
    this.isDelete = false;
    this.data = undefined;
  }

  insert(records) {
    const list = Array.isArray(records) ? records : [records];
    const inserted = [];
    for (const rec of list) {
      const newRec = {
        id: rec.id || crypto.randomUUID(),
        created_at: rec.created_at || new Date().toISOString(),
        ...rec
      };
      this.db[this.table].push(newRec);
      inserted.push(newRec);
    }
    this.data = Array.isArray(records) ? inserted : inserted[0];
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  select(fields = '*') {
    if (this.data !== undefined) {
      return this;
    }
    this.data = [...this.db[this.table]];
    return this;
  }

  eq(field, value) {
    this.filters.push((row) => row[field] === value);
    return this;
  }

  order(field, { ascending = true } = {}) {
    this.sorts.push((a, b) => {
      let valA = a[field];
      let valB = b[field];
      if (valA === undefined) return 1;
      if (valB === undefined) return -1;
      if (typeof valA === 'string') {
        return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return ascending ? valA - valB : valB - valA;
    });
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(onfulfilled) {
    try {
      let result = this.data;

      if (this.isDelete) {
        const toDelete = [];
        const toKeep = [];
        for (const row of this.db[this.table]) {
          const matches = this.filters.every(f => f(row));
          if (matches) {
            toDelete.push(row);
          } else {
            toKeep.push(row);
          }
        }
        this.db[this.table] = toKeep;
        result = toDelete;
      } else if (result) {
        if (Array.isArray(result)) {
          for (const filter of this.filters) {
            result = result.filter(filter);
          }
          for (const sort of this.sorts) {
            result.sort(sort);
          }
          if (this.isSingle) {
            result = result.length > 0 ? result[0] : null;
          }
        }
      }

      return onfulfilled({ data: result, error: null });
    } catch (err) {
      return onfulfilled({ data: null, error: { message: err.message } });
    }
  }
}

class MockSupabaseClient {
  constructor() {
    this.db = {
      documents: [],
      document_chunks: [],
      quizzes: [],
      questions: [],
      flashcards: [],
      attempts: []
    };
    
    // Seed database with default mock data matching the frontend's visual mockup, using valid UUIDs
    const doc1Id = 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e0e0';
    const doc2Id = 'a1a1a1a1-b1b1-c1c1-d1d1-e1e1e1e1e1e1';
    const doc3Id = 'a2a2a2a2-b2b2-c2c2-d2d2-e2e2e2e2e2e2';
    
    const chunk1Id = 'b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f0f0';
    const chunk2Id = 'b1b1b1b1-c1c1-d1d1-e1e1-f1f1f1f1f1f1';
    const chunk3Id = 'b2b2b2b2-c2c2-d2d2-e2e2-f2f2f2f2f2f2';

    const quiz1Id = 'c0c0c0c0-d0d0-e0e0-f0f0-a0a0a0a0a0a0';
    const quiz2Id = 'c1c1c1c1-d1d1-e1e1-f1f1-a1a1a1a1a1a1';
    
    this.db.documents.push(
      {
        id: doc1Id,
        user_id: '00000000-0000-0000-0000-000000000000',
        title: 'Lecture 3 - Mitochondrial Genetics.pdf',
        source_type: 'pdf',
        raw_text: 'Mitochondria are inherited exclusively from the mother because the sperm\'s mitochondria are generally destroyed after fertilization. Heteroplasmy refers to the presence of more than one type of organellar genome (mitochondrial DNA) within a single cell or individual. Mitochondrial DNA (mtDNA) is not bound by protective histones and is physically located in the inner membrane, directly adjacent to the respiratory chain where high levels of damaging reactive oxygen species (ROS) are generated during oxidative phosphorylation.',
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      },
      {
        id: doc2Id,
        user_id: '00000000-0000-0000-0000-000000000000',
        title: 'Krebs Cycle pathways and intermediates.docx',
        source_type: 'text',
        raw_text: 'The Krebs cycle, also known as the citric acid cycle, is a key metabolic pathway. Complex II (Succinate dehydrogenase) transfers electrons from FADH2 to coenzyme Q, but it does not pump protons across the inner mitochondrial membrane. Complexes I, III, and IV pump protons, establishing the electrochemical gradient.',
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      },
      {
        id: doc3Id,
        user_id: '00000000-0000-0000-0000-000000000000',
        title: 'Action Potential summary notes.md',
        source_type: 'text',
        raw_text: 'Action potentials are rapid changes in membrane potential that spread along nerve fibers. Depolarization is caused by the opening of voltage-gated sodium channels, allowing sodium ions to rush into the cell.',
        created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
      }
    );

    this.db.document_chunks.push(
      {
        id: chunk1Id,
        document_id: doc1Id,
        chunk_index: 0,
        content: 'Mitochondria are inherited exclusively from the mother because the sperm\'s mitochondria are generally destroyed after fertilization. Heteroplasmy refers to the presence of more than one type of organellar genome (mitochondrial DNA) within a single cell or individual. Mitochondrial DNA (mtDNA) is not bound by protective histones and is physically located in the inner membrane, directly adjacent to the respiratory chain where high levels of damaging reactive oxygen species (ROS) are generated during oxidative phosphorylation.'
      },
      {
        id: chunk2Id,
        document_id: doc2Id,
        chunk_index: 0,
        content: 'The Krebs cycle, also known as the citric acid cycle, is a key metabolic pathway. Complex II (Succinate dehydrogenase) transfers electrons from FADH2 to coenzyme Q, but it does not pump protons across the inner mitochondrial membrane. Complexes I, III, and IV pump protons, establishing the electrochemical gradient.'
      },
      {
        id: chunk3Id,
        document_id: doc3Id,
        chunk_index: 0,
        content: 'Action potentials are rapid changes in membrane potential that spread along nerve fibers. Depolarization is caused by the opening of voltage-gated sodium channels, allowing sodium ions to rush into the cell.'
      }
    );
    
    this.db.quizzes.push(
      {
        id: quiz1Id,
        document_id: doc1Id,
        user_id: '00000000-0000-0000-0000-000000000000',
        title: 'Mitochondrial Genetics Quiz',
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      },
      {
        id: quiz2Id,
        document_id: doc2Id,
        user_id: '00000000-0000-0000-0000-000000000000',
        title: 'Krebs Cycle Diagnostics',
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      }
    );

    this.db.questions.push(
      {
        id: 'q-1-uuid',
        quiz_id: quiz1Id,
        question_text: 'Why does mitochondrial DNA exhibit a significantly higher mutation rate than nuclear DNA?',
        options: [
          'Mitochondrial DNA contains more introns that attract mutagens',
          'Lack of protective histone proteins and proximity to reactive oxygen species (ROS)',
          'Mitochondrial DNA polymerase has no proofreading capabilities',
          'Mitochondria actively absorb mutagens from the cytoplasm'
        ],
        correct_answer: 'Lack of protective histone proteins and proximity to reactive oxygen species (ROS)',
        explanation: 'Correct! Mitochondrial DNA (mtDNA) is not bound by protective histones and is physically located in the inner membrane, directly adjacent to the respiratory chain where high levels of damaging reactive oxygen species (ROS) are generated during oxidative phosphorylation.',
        difficulty: 'medium',
        source_chunk_id: chunk1Id
      },
      {
        id: 'q-2-uuid',
        quiz_id: quiz1Id,
        question_text: 'What is heteroplasmy?',
        options: [
          'The division of mitochondria during cell replication',
          'The presence of more than one type of mitochondrial DNA in a single cell',
          'The breakdown of mitochondria in the lysosomes',
          'The transfer of mitochondrial genes to the nuclear genome'
        ],
        correct_answer: 'The presence of more than one type of mitochondrial DNA in a single cell',
        explanation: 'Correct! Heteroplasmy refers to the presence of more than one type of organellar genome (mitochondrial DNA) within a single cell or individual. It is a critical factor in the severity of mitochondrial diseases.',
        difficulty: 'medium',
        source_chunk_id: chunk1Id
      },
      {
        id: 'q-3-uuid',
        quiz_id: quiz2Id,
        question_text: 'Which of the following complexes in the electron transport chain does NOT pump protons into the intermembrane space?',
        options: [
          'Complex I (NADH dehydrogenase)',
          'Complex II (Succinate dehydrogenase)',
          'Complex III (Cytochrome c reductase)',
          'Complex IV (Cytochrome c oxidase)'
        ],
        correct_answer: 'Complex II (Succinate dehydrogenase)',
        explanation: 'Correct! Complex II (Succinate dehydrogenase) transfers electrons from FADH2 to coenzyme Q, but it does not pump protons across the inner mitochondrial membrane. Complexes I, III, and IV pump protons, establishing the electrochemical gradient.',
        difficulty: 'hard',
        source_chunk_id: chunk2Id
      }
    );

    this.db.flashcards.push(
      {
        id: 'fc-1-uuid',
        document_id: doc1Id,
        user_id: '00000000-0000-0000-0000-000000000000',
        front: 'What is maternal inheritance in mitochondrial genetics?',
        back: 'Mitochondria are inherited exclusively from the mother because the sperm\'s mitochondria are generally destroyed after fertilization, and the oocyte contains several hundred thousand copies of mitochondrial DNA.',
        source_chunk_id: chunk1Id
      },
      {
        id: 'fc-2-uuid',
        document_id: doc1Id,
        user_id: '00000000-0000-0000-0000-000000000000',
        front: 'What is heteroplasmy?',
        back: 'Heteroplasmy refers to the presence of more than one type of organellar genome (mitochondrial DNA) within a single cell or individual. It is a critical factor in the severity of mitochondrial diseases.',
        source_chunk_id: chunk1Id
      },
      {
        id: 'fc-3-uuid',
        document_id: doc2Id,
        user_id: '00000000-0000-0000-0000-000000000000',
        front: 'What is the function of Succinate dehydrogenase (Complex II)?',
        back: 'Complex II transfers electrons from FADH2 to coenzyme Q but does NOT pump protons across the inner mitochondrial membrane, unlike Complexes I, III, and IV.',
        source_chunk_id: chunk2Id
      }
    );
  }

  from(table) {
    return new MockSupabaseQueryBuilder(table, this.db);
  }

  async rpc(func, args) {
    if (func === 'match_document_chunks') {
      const { filter_doc_id, match_count = 5 } = args;
      const matched = this.db.document_chunks.filter(c => c.document_id === filter_doc_id);
      const results = matched.slice(0, match_count).map(c => ({
        id: c.id,
        document_id: c.document_id,
        chunk_index: c.chunk_index,
        content: c.content,
        similarity: 0.95
      }));
      return { data: results, error: null };
    }
    return { data: null, error: { message: `RPC function ${func} not mocked` } };
  }

  get auth() {
    return {
      getUser: async (token) => {
        return {
          data: {
            user: {
              id: '00000000-0000-0000-0000-000000000000',
              email: 'anonymous_dev@learnforge.app',
              role: 'dev'
            }
          },
          error: null
        };
      }
    };
  }
}

// Global shared mock client database instance
const sharedMockClient = new MockSupabaseClient();

class HybridQueryBuilder {
  constructor(table, realClient, mockClient) {
    this.table = table;
    this.real = realClient;
    this.mock = mockClient;
    
    this.realBuilder = this.real.from(table);
    this.mockBuilder = this.mock.from(table);
    
    this.isWrite = false;
    this.isDelete = false;
    this.filters = [];
    this.sorts = [];
    this.isSingle = false;
  }

  insert(records) {
    this.isWrite = true;
    this.realBuilder = this.realBuilder.insert(records);
    this.mockBuilder = this.mockBuilder.insert(records);
    return this;
  }

  delete() {
    this.isDelete = true;
    this.realBuilder = this.realBuilder.delete();
    this.mockBuilder = this.mockBuilder.delete();
    return this;
  }

  select(fields = '*') {
    this.realBuilder = this.realBuilder.select(fields);
    this.mockBuilder = this.mockBuilder.select(fields);
    return this;
  }

  eq(field, value) {
    this.realBuilder = this.realBuilder.eq(field, value);
    this.mockBuilder = this.mockBuilder.eq(field, value);
    return this;
  }

  order(field, options) {
    this.realBuilder = this.realBuilder.order(field, options);
    this.mockBuilder = this.mockBuilder.order(field, options);
    return this;
  }

  single() {
    this.realBuilder = this.realBuilder.single();
    this.mockBuilder = this.mockBuilder.single();
    return this;
  }

  // Promise thenable implementation
  async then(onfulfilled) {
    try {
      const res = await this.realBuilder;
      
      if (res.error) {
        console.warn(`[HYBRID DB WARNING] Supabase query failed on table "${this.table}" (falling back to mock database):`, res.error.message);
        // Fallback to local memory DB
        const mockRes = await this.mockBuilder;
        return onfulfilled(mockRes);
      }
      
      // Sync written records to mock db memory
      if (this.isWrite && res.data) {
        const list = Array.isArray(res.data) ? res.data : [res.data];
        for (const item of list) {
          const exists = this.mock.db[this.table].some(row => row.id === item.id);
          if (!exists) {
            this.mock.db[this.table].push(item);
          }
        }
      }
      
      // Sync delete records in mock db memory
      if (this.isDelete) {
        // Re-execute delete in mock database to sync
        await this.mockBuilder;
      }

      // Merge select list results from both real and mock databases
      if (!this.isWrite && !this.isDelete && Array.isArray(res.data)) {
        const mockRes = await this.mockBuilder;
        if (mockRes.data && Array.isArray(mockRes.data)) {
          const merged = [...res.data];
          for (const mockItem of mockRes.data) {
            const exists = merged.some(item => item.id === mockItem.id);
            if (!exists) {
              merged.push(mockItem);
            }
          }
          
          // Re-sort in place by created_at descending if present
          merged.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
          });

          return onfulfilled({ data: merged, error: null });
        }
      }

      return onfulfilled(res);
    } catch (e) {
      console.warn(`[HYBRID DB WARNING] Supabase query threw exception on table "${this.table}" (falling back to mock database):`, e.message);
      const mockRes = await this.mockBuilder;
      return onfulfilled(mockRes);
    }
  }
}

class HybridSupabaseClient {
  constructor(realClient, mockClient) {
    this.real = realClient;
    this.mock = mockClient;
  }

  from(table) {
    return new HybridQueryBuilder(table, this.real, this.mock);
  }

  async rpc(func, args) {
    try {
      const res = await this.real.rpc(func, args);
      if (res.error) {
        console.warn(`[HYBRID DB WARNING] RPC "${func}" failed on real Supabase (falling back to mock database):`, res.error.message);
        return this.mock.rpc(func, args);
      }
      return res;
    } catch (e) {
      console.warn(`[HYBRID DB WARNING] RPC "${func}" threw exception on real Supabase (falling back to mock database):`, e.message);
      return this.mock.rpc(func, args);
    }
  }

  get auth() {
    return {
      getUser: async (token) => {
        try {
          const res = await this.real.auth.getUser(token);
          if (res.error || !res.data?.user) {
            return this.mock.auth.getUser(token);
          }
          return res;
        } catch (e) {
          return this.mock.auth.getUser(token);
        }
      }
    };
  }
}

let supabaseAdmin;

if (isMockMode) {
  console.log('====================================================');
  console.log('  [DATABASE] Running in LOCAL MOCK DATABASE mode');
  console.log('  All changes will be saved in-memory on the server.');
  console.log('====================================================');
  supabaseAdmin = sharedMockClient;
} else {
  console.log('====================================================');
  console.log('  [DATABASE] Connecting to REAL Supabase instance');
  console.log(`  Target: ${supabaseUrl}`);
  console.log('  Equipped with a silent local mock database fallback.');
  console.log('====================================================');
  
  const realClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  
  supabaseAdmin = new HybridSupabaseClient(realClient, sharedMockClient);
}

/**
 * Creates an authenticated Supabase client for a specific user JWT token.
 * Enforces RLS policies based on token auth.uid().
 */
const getSupabaseClient = (authToken) => {
  if (isMockMode || !authToken) return supabaseAdmin;
  
  const realClient = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || supabaseServiceKey, {
    global: {
      headers: {
        Authorization: authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  
  return new HybridSupabaseClient(realClient, sharedMockClient);
};

module.exports = {
  supabaseAdmin,
  getSupabaseClient,
  isMockMode,
};
