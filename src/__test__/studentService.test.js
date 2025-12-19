import { jest } from '@jest/globals';
// The Arrange, Act, Assert pattern (AAA) in unit tests
// Tests for studentService using ESM and Jest mocks
// Mock the repository module to avoid using a real MongoDB





// Mock the repository
jest.unstable_mockModule('../repository/studentRepository.js', () => ({
    findStudentById: jest.fn(),
    createStudent: jest.fn(),
    deleteStudentById: jest.fn(),
    updateStudent: jest.fn(),
    updateStudentScores: jest.fn(),
    findStudentByName: jest.fn(),
    countStudentsByName: jest.fn(),
    findStudentsByMinScore: jest.fn(),
}));

const repo = await import('../repository/studentRepository.js');
const { 
    addStudent, 
    findStudent, 
    deleteStudent, 
    updateStudent: updateStudentService, 
    addScore, 
    findByName, 
    countByNames, 
    findByMinScore 
} = await import('../service/studentService.js');

describe('studentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addStudent', () => {
        it('should return false if student already exists', async () => {
            repo.findStudentById.mockResolvedValue({ id: '1' });
            const result = await addStudent({ id: '1', name: 'Test', password: '123' });
            expect(result).toBe(false);
            expect(repo.findStudentById).toHaveBeenCalledWith('1');
            expect(repo.createStudent).not.toHaveBeenCalled();
        });

        it('should create student and return true if student does not exist', async () => {
            repo.findStudentById.mockResolvedValue(null);
            repo.createStudent.mockResolvedValue({});
            const result = await addStudent({ id: '1', name: 'Test', password: '123' });
            expect(result).toBe(true);
            expect(repo.createStudent).toHaveBeenCalledWith({ _id: '1', name: 'Test', password: '123' });
        });
    });

    describe('findStudent', () => {
        it('should return student without password if found', async () => {
            repo.findStudentById.mockResolvedValue({ id: '1', name: 'Test', password: '123' });
            const result = await findStudent('1');
            expect(result.password).toBeUndefined();
            expect(result.name).toBe('Test');
        });

        it('should return null if student not found', async () => {
            repo.findStudentById.mockResolvedValue(null);
            const result = await findStudent('1');
            expect(result).toBeNull();
        });
    });

    describe('deleteStudent', () => {
        it('should return deleted student without password', async () => {
            repo.deleteStudentById.mockResolvedValue({ id: '1', name: 'Test', password: '123' });
            const result = await deleteStudent('1');
            expect(result.password).toBeUndefined();
        });
    });

    describe('updateStudent', () => {
        it('should return updated student without scores', async () => {
            repo.updateStudent.mockResolvedValue({ id: '1', name: 'Test', scores: { math: 100 } });
            const result = await updateStudentService('1', { name: 'New Name' });
            expect(result.scores).toBeUndefined();
            expect(result.name).toBe('Test');
        });
    });

    describe('addScore', () => {
        it('should call updateStudentScores', async () => {
            repo.updateStudentScores.mockResolvedValue({});
            await addScore('1', 'math', 95);
            expect(repo.updateStudentScores).toHaveBeenCalledWith('1', 'math', 95);
        });
    });

    describe('findByName', () => {
        it('should return students without passwords', async () => {
            repo.findStudentByName.mockResolvedValue([
                { id: '1', name: 'Test', password: '123' },
                { id: '2', name: 'Test', password: '456' }
            ]);
            const result = await findByName('Test');
            expect(result).toHaveLength(2);
            expect(result[0].password).toBeUndefined();
            expect(result[1].password).toBeUndefined();
        });
    });

    describe('countByNames', () => {
        it('should return the count of students', async () => {
            repo.countStudentsByName.mockResolvedValue(5);
            const result = await countByNames(['Test1', 'Test2']);
            expect(result).toBe(5);
            expect(repo.countStudentsByName).toHaveBeenCalledWith(['Test1', 'Test2']);
        });
    });

    describe('findByMinScore', () => {
        it('should return students with min score and without passwords', async () => {
            repo.findStudentsByMinScore.mockResolvedValue([
                { id: '1', name: 'Test', password: '123', scores: { math: 90 } }
            ]);
            const result = await findByMinScore('math', 80);
            expect(result).toHaveLength(1);
            expect(result[0].password).toBeUndefined();
        });
    });
});
