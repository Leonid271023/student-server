import { jest } from '@jest/globals';
import request from 'supertest';

jest.unstable_mockModule('../service/studentService.js', () => ({
    addStudent: jest.fn(),
    findStudent: jest.fn(),
    updateStudent: jest.fn(),
    deleteStudent: jest.fn(),
    addScore: jest.fn(),
    findByName: jest.fn(),
    countByNames: jest.fn(),
    findByMinScore: jest.fn(),
}));

const service = await import('../service/studentService.js');
const { default: app } = await import('../server.js');

describe('Student Controller Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /student', () => {
        it('should add a student successfully and return 201', async () => {
            const studentData = { id: 1, name: 'John Doe', password: 'password123' };
            service.addStudent.mockResolvedValue(true);

            const response = await request(app)
                .post('/student')
                .send(studentData);

            expect(response.status).toBe(201);
            expect(service.addStudent).toHaveBeenCalledWith(studentData);
        });

        it('should return 409 if student already exists', async () => {
            const studentData = { id: 1, name: 'John Doe', password: 'password123' };
            service.addStudent.mockResolvedValue(false);

            const response = await request(app)
                .post('/student')
                .send(studentData);

            expect(response.status).toBe(409);
        });

        it('should return 400 for invalid input', async () => {
            const invalidData = { id: 1 }; // missing name and password

            const response = await request(app)
                .post('/student')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /student/:id', () => {
        it('should find and return a student by id', async () => {
            const student = { id: 1, name: 'John Doe' };
            service.findStudent.mockResolvedValue(student);

            const response = await request(app).get('/student/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(student);
            expect(service.findStudent).toHaveBeenCalledWith(1);
        });

        it('should return 404 if student not found', async () => {
            service.findStudent.mockResolvedValue(null);

            const response = await request(app).get('/student/999');

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /student/:id', () => {
        it('should update a student and return 200', async () => {
            const updateData = { name: 'Jane Doe' };
            const updatedStudent = { id: 1, name: 'Jane Doe' };
            service.updateStudent.mockResolvedValue(updatedStudent);

            const response = await request(app)
                .patch('/student/1')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedStudent);
            expect(service.updateStudent).toHaveBeenCalledWith(1, updateData);
        });

        it('should return 404 if student to update not found', async () => {
            service.updateStudent.mockResolvedValue(null);

            const response = await request(app)
                .patch('/student/999')
                .send({ name: 'Jane Doe' });

            expect(response.status).toBe(404);
        });

        it('should return 400 for invalid update data', async () => {
            // טיפוס לא נכון -> אמור ליפול בוודאות אם name מוגדר כ-string בסכימה
            const response = await request(app)
                .patch('/student/1')
                .send({ name: 123 });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(service.updateStudent).not.toHaveBeenCalled();
        });
    });

    describe('DELETE /student/:id', () => {
        it('should delete a student and return 200', async () => {
            const deletedStudent = { id: 1, name: 'John Doe' };
            service.deleteStudent.mockResolvedValue(deletedStudent);

            const response = await request(app).delete('/student/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(deletedStudent);
            expect(service.deleteStudent).toHaveBeenCalledWith(1);
        });

        it('should return 404 if student to delete not found', async () => {
            service.deleteStudent.mockResolvedValue(null);

            const response = await request(app).delete('/student/999');

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /score/student/:id', () => {
        it('should add a score and return 204', async () => {
            const scoreData = { examName: 'Math', score: 95 };
            service.addScore.mockResolvedValue(true);

            const response = await request(app)
                .patch('/score/student/1')
                .send(scoreData);

            expect(response.status).toBe(204);
            expect(service.addScore).toHaveBeenCalledWith(1, 'Math', 95);
        });

        it('should return 404 if student or exam not found', async () => {
            service.addScore.mockResolvedValue(false);

            const response = await request(app)
                .patch('/score/student/1')
                .send({ examName: 'Math', score: 95 });

            expect(response.status).toBe(404);
        });

        it('should return 400 for invalid score data', async () => {
            const response = await request(app)
                .patch('/score/student/1')
                .send({ examName: 'Math', score: 105 }); // score > 100

            expect(response.status).toBe(400);
        });
    });

    describe('GET /students/name/:name', () => {
        it('should return students by name', async () => {
            const students = [{ id: 1, name: 'John' }];
            service.findByName.mockResolvedValue(students);

            const response = await request(app).get('/students/name/John');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(students);
            expect(service.findByName).toHaveBeenCalledWith('John');
        });
    });

    describe('GET /quantity/students', () => {
        it('should return count by names from query', async () => {
            const counts = [{ name: 'John', count: 1 }];
            service.countByNames.mockResolvedValue(counts);

            const response = await request(app).get('/quantity/students?names=John&names=Jane');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(counts);
            expect(service.countByNames).toHaveBeenCalledWith(['John', 'Jane']);
        });

        it('should handle single name in query', async () => {
            service.countByNames.mockResolvedValue([]);

            await request(app).get('/quantity/students?names=John');

            expect(service.countByNames).toHaveBeenCalledWith(['John']);
        });
    });

    describe('GET /students/exam/:exam/minscore/:minScore', () => {
        it('should return students by min score in exam', async () => {
            const students = [{ id: 1, name: 'John' }];
            service.findByMinScore.mockResolvedValue(students);

            const response = await request(app).get('/students/exam/Math/minscore/80');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(students);
            expect(service.findByMinScore).toHaveBeenCalledWith('Math', 80);
        });
    });

});
