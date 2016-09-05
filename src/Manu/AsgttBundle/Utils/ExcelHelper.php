<?php

namespace Manu\AsgttBundle\Utils;

class ExcelHelper {

	public static function getColAndRowFromCellName($cellName) {
		$col = '';
		$row = '';
		
		$writeInRow = false;
		for ($i = 0; $i < strlen($cellName); $i++) {
			$char = $cellName[$i];
			if ($writeInRow) {
				$row .= $char;
				continue;
			}
			if ($char == '0' || $char == '1' || $char == '2' || $char == '3' || 
					$char == '4' || $char == '5' || $char == '6' || $char == '7' || 
					$char == '8' || $char == '9') {
				
				$row .= $char;
				$writeInRow = true;
				continue;
			}
			$col .= $char;
		}
		
		return array('col' => $col, 'row' => $row);
	}
	
	public static function colToNum($col) {
		$num = 0;
		$col = strtoupper($col);
		for ($i = 0; $i < strlen($col); $i++) {
			$char = $col[$i];
			$intval = ord($char) - 64;
			
			$num *= 26;
			$num += $intval;
		}
		
		//error_log("colToNum(".$col.") = ".$num);
		return $num;
	}
	public static function numToCol($num) {
		$orig = $num;
		$col = '';
		while (($n = floor($num/27)) > 0) {
			$char = chr($n+64);
			$col .= $char;
			$num = $num - ($n*26);
		}
		if ($num > 0) {
			$char = chr($num+64);
			$col .= $char;
		}
		//error_log("numToCol(".$orig.") = ".$col);
		return $col;
	}
	
	public static function getDestCell($orig, $widthHoriz, $widthVert) {
		$colRow = ExcelHelper::getColAndRowFromCellName($orig);
		$col = $colRow['col'];
		$row = $colRow['row'];
		 
		$colNum = ExcelHelper::colToNum($col);
		$colNumDest = $colNum + $widthHoriz - 1;
		$colDest = ExcelHelper::numToCol($colNumDest);
		 
		$rowDest = intval($row) + $widthVert - 1;
		 
		return $colDest.$rowDest;
	}
}
?>
