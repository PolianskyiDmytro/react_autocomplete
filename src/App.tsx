import React, { useCallback, useMemo, useState } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';
import { Person } from './types/Person';
import debounce from 'lodash.debounce';

interface Props {
  delay: number;
}

export const App: React.FC<Props> = ({ delay = 300 }) => {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [people, setPeople] = useState<Person[] | []>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | string>('');

  const applyQuery = useCallback(debounce(setAppliedQuery, delay), []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPerson('');
    setQuery(e.target.value);
    applyQuery(e.target.value);
  };

  const handleInputClick = useCallback(
    debounce(() => setPeople(peopleFromServer), delay),
    [],
  );

  const onSelected = (person: Person) => {
    setQuery(person.name);
    setAppliedQuery(person.name);
    setSelectedPerson(person);
    setPeople([]);
  };

  const filteredPeople = useMemo(
    () =>
      people.filter(person =>
        person.name.toLowerCase().includes(appliedQuery.toLowerCase()),
      ),
    [people, appliedQuery],
  );

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        {typeof selectedPerson === 'string' ? (
          <h1 className="title" data-cy="title">
            {`No selected person`}
          </h1>
        ) : (
          <h1 className="title" data-cy="title">
            {`${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`}
          </h1>
        )}
        <div className="dropdown is-active">
          <div className="dropdown-trigger">
            <input
              type="text"
              data-cy="search-input"
              placeholder="Enter a part of the name"
              value={query}
              onFocus={handleInputClick}
              onChange={handleQueryChange}
              onBlur={() => setPeople([])}
            />
          </div>

          <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
            <div className="dropdown-content">
              {filteredPeople.map(person => (
                <div
                  className="dropdown-item"
                  key={person.name}
                  data-cy="suggestion-item"
                  onMouseDown={() => onSelected(person)}
                  style={{ cursor: 'pointer' }}
                >
                  <p className="has-text-link">{person.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {people.length !== 0 && filteredPeople.length === 0 && query && (
          <div
            className="
            notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start
          "
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
