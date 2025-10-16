
export const formatValidationError = (errors)=>{
    if (!errors || !errors.issues) return 'Validation failed';
    return errors.issues.map((i) => i.message).join(', ');

  if(Array.isArray(errors.issue)) return errors.issue.map( i => i.message).join(', ');
  else return JSON.stringify(errors);
};