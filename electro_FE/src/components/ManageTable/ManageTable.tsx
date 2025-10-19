import React from 'react';
import { Link } from 'react-router-dom';
import { ActionIcon, Checkbox, Group, Table } from '@mantine/core';
import { Edit, Eye, Trash } from 'tabler-icons-react';
import BaseResponse from 'models/BaseResponse';
import { EntityPropertySchema } from 'types';
import { ListResponse } from 'utils/FetchUtils';
import useManageTableStyles from 'components/ManageTable/ManageTable.styles';
import useManageTableViewModel from 'components/ManageTable/ManageTable.vm';

export interface ManageTableProps<T> {
  listResponse: ListResponse<T>;
  properties: EntityPropertySchema;
  resourceUrl: string;
  resourceKey: string;
  showedPropertiesFragment: (entity: T) => React.ReactNode;
  entityDetailTableRowsFragment: (entity: T) => React.ReactNode;
}

function ManageTable<T extends BaseResponse>(props: ManageTableProps<T>) {
  const { classes, cx } = useManageTableStyles();

  const {
    listResponse,
    selection,
    tableHeads,
    handleToggleAllRowsCheckbox,
    handleToggleRowCheckbox,
    handleViewEntityButton,
    handleDeleteEntityButton,
  } = useManageTableViewModel<T>(props);

  const entitiesTableHeadsFragment = (
    <tr>
      <th style={{ width: 40 }}>
        <Checkbox
          onChange={handleToggleAllRowsCheckbox}
          checked={selection.length === listResponse.content.length}
          indeterminate={selection.length > 0 && selection.length !== listResponse.content.length}
          transitionDuration={0}
        />
      </th>
      {tableHeads.map((item) => <th key={item}>{item}</th>)}
      <th style={{ width: 120 }}>Thao tác</th>
    </tr>
  );

  const entitiesTableRowsFragment = listResponse.content.map((entity) => {
    const selected = selection.includes(entity._id);

    return (
      <tr
        key={entity._id}
        className={cx({
          [classes.rowSelected]: selected,
        })}
      >
        <td>
          <Checkbox
            checked={selection.includes(entity._id)}
            onChange={() => handleToggleRowCheckbox(entity._id)}
            transitionDuration={0}
          />
        </td>
        {props.showedPropertiesFragment(entity as T)}
        <td>
          <Group spacing="xs">
            <ActionIcon
              color="blue"
              variant="outline"
              size={24}
              title="Xem"
              onClick={() => handleViewEntityButton(entity._id)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              component={Link}
              to={'update/' + entity._id}
              color="teal"
              variant="outline"
              size={24}
              title="Cập nhật"
            >
              <Edit size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              variant="outline"
              size={24}
              title="Xóa"
              onClick={() => handleDeleteEntityButton(entity._id)}
            >
              <Trash size={16} />
            </ActionIcon>
          </Group>
        </td>
      </tr>
    );
  });

  return (
    <Table
      horizontalSpacing="sm"
      verticalSpacing="sm"
      highlightOnHover
      striped
      sx={(theme) => ({
        borderRadius: theme.radius.sm,
        overflow: 'hidden',
      })}
    >
      <thead>{entitiesTableHeadsFragment}</thead>
      <tbody>{entitiesTableRowsFragment}</tbody>
    </Table>
  );
}

export default ManageTable;
