describe('Accessing assignment list via API', () => {
    beforeEach(() => {
        cy.clearDb();
    });

    it('provides correct values', () => {
        // Given
        const assignmentName = 'Test assignment XYZ';
        const subjectId = 3;
        const isExam = false;
        const date = '24.03.2022';

        cy.createAssignmentByApi(
            assignmentName,
            subjectId,
            isExam,
            date,
        );

        cy.request({
            url: '/api/assignments',
            method: 'GET',
        }).then((response) => {
            const data = response.body.data;

            expect(response.status).to.eq(200);
            expect(data.length).to.eq(1);

            const firstAssignment = data[0];

            expect(firstAssignment.name).to.eq(assignmentName);
            expect(firstAssignment.subject_id).to.eq(subjectId);
            expect(firstAssignment.is_exam).to.eq(isExam);
            expect(firstAssignment.date).to.eq('2022-03-24T00:00:00+01:00');
        });
    });
});
