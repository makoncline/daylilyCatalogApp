import styled from "styled-components";

const Badge = styled.div`
  background: var(--gray-1);
  color: var(--gray-9);
  padding: 1px var(--size-1);
  border-radius: var(--radius-2);
  white-space: nowrap;
`;

const GreenBadge = styled(Badge)`
  background: var(--success-light);
  color: var(--success-dark);
`;

export { Badge, GreenBadge };
