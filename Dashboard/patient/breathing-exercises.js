document.addEventListener('DOMContentLoaded', () => {
    // Initialize event listeners for exercise cards
    document.querySelectorAll('.start-exercise').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.exercise-card');
            const exerciseType = card.dataset.exercise;
            startExercise(exerciseType);
        });
    });

    function startExercise(exerciseType) {
        // Hide exercise cards
        document.querySelector('.exercise-cards').style.display = 'none';
        // Show breathing interface
        const interface = document.querySelector('.breathing-interface');
        interface.style.display = 'block';
        
        // Initialize the exercise
        if (window.breathingExercises) {
            window.breathingExercises.startExercise(exerciseType);
        }
    }
});
