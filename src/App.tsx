import * as React from 'react';
import convert from 'xml-js';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { createStyles, makeStyles } from '@material-ui/styles';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useAsync } from './UseAsync';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      alignItems: 'center',
      lineHeight: '24px',
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      '& .cellValue': {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },
  })
);
function isOverflown(element: Element): boolean {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}
interface GridCellExpandProps {
  value: string;
  width: number;
}

const GridCellExpand = React.memo(function GridCellExpand(
  props: GridCellExpandProps
) {
  const { width, value } = props;
  const wrapper = React.useRef<HTMLDivElement | null>(null);
  const cellDiv = React.useRef(null);
  const cellValue = React.useRef(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const classes = useStyles();
  const [showFullCell, setShowFullCell] = React.useState(false);
  const [showPopper, setShowPopper] = React.useState(false);

  const handleMouseEnter = () => {
    const isCurrentlyOverflown = isOverflown(cellValue.current!);
    setShowPopper(isCurrentlyOverflown);
    setAnchorEl(cellDiv.current);
    setShowFullCell(true);
  };

  const handleMouseLeave = () => {
    setShowFullCell(false);
  };

  React.useEffect(() => {
    if (!showFullCell) {
      return undefined;
    }

    function handleKeyDown(nativeEvent: KeyboardEvent) {
      // IE11, Edge (prior to using Bink?) use 'Esc'
      if (nativeEvent.key === 'Escape' || nativeEvent.key === 'Esc') {
        setShowFullCell(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setShowFullCell, showFullCell]);

  return (
    <div
      ref={wrapper}
      className={classes.root}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cellDiv}
        style={{
          height: 1,
          width,
          display: 'block',
          position: 'absolute',
          top: 0,
        }}
      />
      <div ref={cellValue} className='cellValue'>
        {value}
      </div>
      {showPopper && (
        <Popper
          open={showFullCell && anchorEl !== null}
          anchorEl={anchorEl}
          style={{ width, marginLeft: -17 }}
        >
          <Paper
            elevation={1}
            style={{ minHeight: wrapper.current!.offsetHeight - 3 }}
          >
            <Typography variant='body2' style={{ padding: 8 }}>
              {value}
            </Typography>
          </Paper>
        </Popper>
      )}
    </div>
  );
});
interface DataType extends convert.ElementCompact {
  registries: {
    national_commercial_registry: {
      row: {
        id: {
          _text: string;
        };
        status: {
          _text: string;
        };
        eik_pik: {
          _text: string;
        };
        registry_zdds: {
          _text: string;
        };
        registry_date: {
          _text: number;
        };
        name: {
          _text: string;
        };
        transliteration: {
          _text: string;
        };
        legal_form: {
          _text: string;
        };
        permanent_address: {
          _text: string;
        };
        activity_area: {
          _text: string;
        };
        managers: {
          _text: string;
        };
        partners: {
          _text: string;
        };
        capital: {
          _text: string;
        };
      }[];
    };
  };
}

interface ParsedDataType extends convert.ElementCompact {
  id: string;
  status: string;
  eik_pik: string;
  registry_zdds: string;
  registry_date: number;
  name: string;
  transliteration: string;
  legal_form: string;
  permanent_address: string;
  activity_area: string;
  managers: string;
  partners: string;
  capital: string;
}

function renderCellExpand(params: GridRenderCellParams) {
  return (
    <GridCellExpand
      value={params.value ? params.value.toString() : ''}
      width={params.colDef.computedWidth}
    />
  );
}

export function App() {
  const { data: file } = useAsync(
    async () => (await fetch('./commercialRegistry.xml')).text(),
    []
  );
  const xmlToJson: Partial<DataType> = convert.xml2js(file || '', {
    compact: true,
  });

  if (!xmlToJson) return null;
  if (!xmlToJson.registries) return null;

  const rows = xmlToJson?.registries?.national_commercial_registry?.row;

  const parsedData = rows.map((data, index: number) => {
    const parsedData: ParsedDataType = {
      id: '',
      status: '',
      eik_pik: '',
      registry_zdds: '',
      registry_date: 0,
      name: '',
      transliteration: '',
      legal_form: '',
      permanent_address: '',
      activity_area: '',
      managers: '',
      partners: '',
      capital: '',
    };
    parsedData.id = index.toString();
    parsedData.status = data.status._text;
    parsedData.eik_pik = data.eik_pik._text;
    parsedData.registry_zdds = data.registry_zdds._text;
    parsedData.registry_date = data.registry_date._text;
    parsedData.name = data.name._text;
    parsedData.transliteration = data.transliteration._text;
    parsedData.legal_form = data.legal_form._text;
    parsedData.permanent_address = data.permanent_address._text;
    parsedData.activity_area = data.activity_area._text;
    parsedData.managers = data.managers._text;
    parsedData.partners = data.partners._text;
    parsedData.capital = data.capital._text;
    console.log(parsedData.registry_date, isNaN(parsedData.registry_date));
    return parsedData;
  });

  const Header: GridColDef[] = [
    {
      field: 'status',
      headerName: 'Статус',
      width: 150,
      renderCell: renderCellExpand,
    },
    {
      field: 'eik_pik',
      headerName: 'ЕИК/ПИК',
      width: 150,
      renderCell: renderCellExpand,
    },
    {
      field: 'registry_zdds',
      headerName: 'Регистрация по ЗДДС',
      width: 250,
      renderCell: renderCellExpand,
    },
    {
      field: 'registry_date',
      headerName: 'Дата на регистрация',
      width: 250,
      renderCell: renderCellExpand,
    },
    {
      field: 'name',
      headerName: 'Наименование',
      width: 200,
      renderCell: renderCellExpand,
    },
    {
      field: 'transliteration',
      headerName: 'Транслитерация',
      width: 200,
      renderCell: renderCellExpand,
    },
    {
      field: 'legal_form',
      headerName: 'Правна форма',
      width: 200,
      renderCell: renderCellExpand,
    },
    {
      field: 'permanent_address',
      headerName: 'Постоянен адрес',
      width: 200,
      renderCell: renderCellExpand,
    },
    {
      field: 'activity_area',
      headerName: 'Предмет на дейност',
      width: 300,
      renderCell: renderCellExpand,
    },
    {
      field: 'managers',
      headerName: 'Управители',
      width: 300,
      renderCell: renderCellExpand,
    },
    {
      field: 'partners',
      headerName: 'Съдружници',
      width: 250,
      renderCell: renderCellExpand,
    },
    {
      field: 'capital',
      headerName: 'Капитал размер',
      width: 200,
      renderCell: renderCellExpand,
    },
  ];

  return (
    <>
      <Container
        maxWidth='xl'
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
        }}
      >
        <Typography variant='h3' style={{justifySelf: 'center', marginTop: '10px' }}>Национален търговски регистър</Typography>
        <Typography variant='h4' style={{justifySelf: 'center', marginTop: '10px' }}>Модел на данните</Typography>

        <DataGrid rows={parsedData} columns={Header} autoHeight style={{margin: '50px', backgroundColor: '#fff9e6'}} />
      </Container>
    </>
  );
}

export default App;
